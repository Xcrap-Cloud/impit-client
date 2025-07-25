# 🕷️ Xcrap Impit Client

**Xcrap Impit Client** is a package within the Xcrap framework that implements an HTTP client using the [Impit](https://www.npmjs.com/package/impit) library.

-----

## 📦 Installation

Installation is straightforward; just use your preferred dependency manager. Here's an example using NPM:

```cmd
npm i @xcrap/impit-client @xcrap/core @xcrap/parser
```

> You also need to install `@xcrap/parser` and `@xcrap/core` because they are listed as `peerDependencies`. This means the package requires `@xcrap/parser` and `@xcrap/core`, but it will use the versions that the user has installed in their project.

-----

## 🚀 Usage

Like all HTTP clients, `ImpitClient` has two methods: `fetch()` to make a request to a specific URL and `fetchMany()` to make requests to multiple URLs simultaneously, with control over concurrency and delays between requests.

### Usage Example

```ts
import { ImpitClient } from "@xcrap/impit-client"
import { extract } from "@xcrap/parser"

;(async () => {
    const client = new ImpitClient()
    const url = "https://example.com"
    const response = await client.fetch({ url: url })
    const parser = response.asHtmlParser()
    const pageTitle = await parser.parseFist({ query: "title", extractor: extract("innerText") })

    console.log("Page Title:", pageTitle)
})();
```

### Adding a Proxy

In an HTTP client that extends `BaseClient`, you can add a proxy in the constructor as shown in the following examples:

1.  **Providing a `proxy` string**:

    ```ts
    const client = new ImpitClient({ proxy: "http://47.251.122.81:8888" })
    ```

2.  **Providing a function that generates a `proxy`**:

    ```ts
    function randomProxy() {
    	const proxies = [
    		"http://47.251.122.81:8888",
    		"http://159.203.61.169:3128"
    	]

    	const randomIndex = Math.floor(Math.random() * proxies.length)

    	return proxies[randomIndex]
    }

    const client = new ImpitClient({ proxy: randomProxy })
    ```

### Using a Custom User Agent

In a client that extends `BaseClient`, you can also customize the `User-Agent` for requests. You can do this in two ways:

1.  **Providing a `userAgent` string**:

    ```ts
    const client = new ImpitClient({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36" })
    ```

2.  **Providing a function that generates a `userAgent`**:

    ```ts
    function randomUserAgent() {
    	const userAgents = [
    		"Mozilla/5.0 (iPhone; CPU iPhone OS 9_8_4; like Mac OS X) AppleWebKit/603.37 (KHTML, like Gecko)  Chrome/54.0.1244.188 Mobile Safari/601.5",
    		"Mozilla/5.0 (Windows NT 10.3;; en-US) AppleWebKit/537.35 (KHTML, like Gecko) Chrome/47.0.1707.185 Safari/601"
    	]

    	const randomIndex = Math.floor(Math.random() * userAgents.length)

    	return userAgents[randomIndex]
    }

    const client = new ImpitClient({ userAgent: randomUserAgent })
    ```

### Using a Custom Proxy URL

In a client that extends `BaseClient`, you can use proxy URLs. While the exact explanation of how they work might be complex, I encountered this type of proxy when trying to solve CORS issues by making client-side requests, and that's how I learned about *CORS Proxy*. Here's a [template](https://gist.github.com/marcuth/9fbd321b011da44d1287faae31a8dd3a) for a CloudFlare Workers implementation if you want to set up your own.

You can configure this in the same way we configured `userAgent`:

1.  **Providing a `proxyUrl` string**:

    ```ts
    const client = new ImpitClient({ proxyUrl: "https://my-proxy-app.my-username.workers.dev" })
    ```

2.  **Providing a function that generates a `proxyUrl`**:

    ```ts
    function randomProxyUrl() {
    	const proxyUrls = [
    		"https://my-proxy-app.my-username-1.workers.dev",
    		"https://my-proxy-app.my-username-2.workers.dev"
    	]

    	const randomIndex = Math.floor(Math.random() * proxyUrls.length)

    	return proxyUrls[randomIndex]
    }

    const client = new ImpitClient({ proxyUrl: randomProxyUrl })
    ```

-----

## 🧪 Tests

Automated tests are located in `__tests__`. To run them:

```bash
npm run test
```

-----

## 🤝 Contributing

Want to contribute? Follow these steps:

  * Fork the repository.
  * Create a new branch (`git checkout -b feature-new`).
  * Commit your changes (`git commit -m 'Add new feature'`).
  * Push to the branch (`git push origin feature-new`).
  * Open a Pull Request.

-----

## 📝 License

This project is licensed under the MIT License.