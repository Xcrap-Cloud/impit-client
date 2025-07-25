import { BaseClient, BaseClientOptions, ClientInterface, ClientFetchOptions, ClientFetchManyOptions, FaliedAttempt, HttpResponse, defaultUserAgent, InvalidStatusCodeError, delay } from "@xcrap/core"
import { extract } from "@xcrap/parser"
import { Impit, ImpitOptions, RequestInit } from "impit"

export type ImpitProxy = string

export type ImpitClientOptions = Omit<BaseClientOptions<ImpitProxy> & ImpitOptions, "proxyUrl">

export type ImpitClientFetchOptions = ClientFetchOptions & RequestInit

export type ImpitClientFetchManyOptions = ClientFetchManyOptions<ImpitClientFetchOptions>

export class ImpitClient extends BaseClient<ImpitProxy> implements ClientInterface {
    private readonly impit: Impit

    constructor(options: ImpitClientOptions = {}) {
        super(options)

        const impitOptions = {
            browser: options.browser,
            ignoreTlsErrors: options.ignoreTlsErrors,
            vanillaFallback: options.vanillaFallback,
            timeout: options.timeout,
            http3: options.http3,
            followRedirects: options.followRedirects,
            maxRedirects: options.maxRedirects,
            cookieJar: options.cookieJar,
            headers: options.headers,
        }

        this.impit = new Impit(impitOptions)
    }

    async fetch({
        url,
        maxRetries = 0,
        retries = 0,
        retryDelay,
        method = "GET",
        headers,
        ...options
    }: ImpitClientFetchOptions): Promise<HttpResponse> {
        const failedAttempts: FaliedAttempt[] = []
        const attemptRequest = async (currentRetry: number): Promise<HttpResponse> => {
            try {
                const fullUrl = this.currentProxyUrl ? `${this.currentProxyUrl}${url}` : url
                const requestHeaders = new Headers(headers)

                requestHeaders.set("User-Agent", this.currentUserAgent ?? defaultUserAgent)

                const response = await this.impit.fetch(fullUrl, {
                    ...options,
                    method: method,
                    headers: requestHeaders,
                })

                if (!this.isSuccess(response.status)) {
                    throw new InvalidStatusCodeError(response.status)
                }

                return new HttpResponse({
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    body: await response.text(),
                    attempts: currentRetry + 1,
                    failedAttempts: failedAttempts,
                })
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error"
                
                failedAttempts.push({ error: errorMessage, timestamp: new Date() })

                if (currentRetry < maxRetries) {
                    if (retryDelay !== undefined && retryDelay > 0) {
                        await delay(retryDelay)
                    }

                    return await attemptRequest(currentRetry + 1)
                }

                return new HttpResponse({
                    status: error.response?.status || 500,
                    statusText: error.response?.statusText || "Request Failed",
                    body: error.response?.data || errorMessage,
                    headers: error.response?.headers || {},
                    attempts: currentRetry + 1,
                    failedAttempts: failedAttempts,
                })
            }
        }

        return attemptRequest(retries)

    }

    async fetchMany({ requests, concurrency, requestDelay }: ImpitClientFetchManyOptions): Promise<HttpResponse[]> {
        const results: HttpResponse[] = []
        const executing: Promise<void>[] = []

        for (let i = 0; i < requests.length; i++) {
            const promise = this.executeRequest({
                request: requests[i],
                index: i,
                requestDelay: requestDelay,
                results: results
            }).then(() => undefined)

            executing.push(promise)

            if (this.shouldThrottle(executing, concurrency)) {
                await this.handleConcurrency(executing)
            }
        }
    
        await Promise.all(executing)

        return results
    }
}