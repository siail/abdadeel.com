---
author: Abdullah Adeel
pubDatetime: 2023-06-01T15:22:00Z
modDatetime: 2024-01-13T20:05:38Z
title: Supercharge Your Web Apps - Harnessing Web Assembly for High Performance
slug: supercharge-webapps-using-webassembly
featured: true
draft: false
ogImage: /assets/blog/supercharge-webapps-using-webassembly.webp
tags:
  - webassembly
  - wasm
  - rust
description: Harnessing Web Assembly for High Performance
conicalUrl: https://dev.to/abdadeel/supercharge-your-web-apps-harnessing-web-assembly-for-high-performance-f4d
---

![Supercharge Your Web Apps - Harnessing Web Assembly for High Performance | abdadeel](@assets/blog/supercharge-webapps-using-webassembly.webp)

## Table of contents

## Introduction

WebAssembly (Wasm) is a binary instruction format designed to be executed efficiently in web browsers. It serves as a complement to JavaScript, allowing developers to write performance-critical code in languages like Rust, C++, and C and run it in the browser. By compiling code to Wasm, it becomes platform-independent and can run at near-native speeds. Rust, a systems programming language known for its safety and performance, has gained popularity in the WebAssembly ecosystem due to its strong guarantees and seamless integration with Wasm. WebAssembly opens up new possibilities for web development by enabling the execution of complex tasks, such as game engines, image processing, and scientific simulations, with impressive performance.

Here is a short video that you might want to watch before continue reading.

<div style="display:flex;align-items:center;justify-content:center;width:100%;overflow-x:auto">
<iframe width="560" height="315" src="https://www.youtube.com/embed/F1sYgWG6EyI" frameborder="0" allowfullscreen></iframe>
</div>

## Advantages of WebAssembly

Improved performance for computationally demanding jobs is one of WASM's most persuasive features. For instance, WebAssembly can be much faster than regular JavaScript when doing complicated statistical calculations on enormous datasets. This is so that code can be executed considerably more quickly than it can in JavaScript thanks to WebAssembly's highly optimised design.
The portability of WebAssembly is another benefit. Cross-platform applications are simple to develop since WebAssembly code can be generated from a wide variety of languages and executed on any platform that does.
Finally, security is another consideration in the architecture of WebAssembly. Code cannot access sensitive data or run harmful code because of the sandboxed execution environment it offers.

## Using WebAssembly in Rust

Rust is a systems programming language that provides memory safety and performance. It is also a great language for writing WebAssembly code. Let's take a look at how to use WebAssembly in Rust.

## Setting up the project

To get started, we need to install a tool called wasm-pack. We can use cargo to install the tool

```bash
cargo install wasm-pack
```

Once we have `wasm-pack` installed, we can create a new Rust project and add the required functions. We can annotate these functions with the `wasm-bindgen` attribute, which takes care of all the things required to call these functions from JavaScript behind the scenes.

### Setting up the Rust environment

- Install Rust by following the official Rust documentation.
- Create a new Rust project using `cargo new --lib wasm-tools`.
- Navigate to the project directory using `cd wasm-tools`.

### Implementing the Fibonacci function in Rust

- Open the `src/lib.rs` file in a text editor.
- Replace the default code with the following Rust implementation of the Fibonacci function

```rust
#[wasm_bindgen]
pub fn fib(n: usize) -> usize {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}
```

### Building the Rust code for WebAssembly

- Open the terminal and navigate to the project directory (`wasm-tools`).
- Run the command `wasm-pack build --target web --release` to build the Rust code as a WebAssembly package.

### Using on the frontend

- Create an `index.html` file and add basic boilerplate code.
- Attach `main.js` script.
- Add the following function in the `main.js` file so that we can compare performance of both the functions.

```js
import init, {
  add,
  greet,
  fib,
  alert_wasm,
} from "./wasm-tools/pkg/wasm_tools.js";

const app = document.getElementById("app");
const btn = document.getElementById("btn");
const btnWasmAlert = document.getElementById("btn-wasm-alert");

btn.addEventListener("click", handleTriggerFib);
btnWasmAlert.addEventListener("click", () => {
  alert_wasm("Hello from Wasm");
});

function updateContent(content) {
  const div = document.createElement("div");
  div.innerHTML = content;
  app.appendChild(div);
}

function fibJS(n) {
  if (n < 2) {
    return n;
  }
  return fibJS(n - 1) + fibJS(n - 2);
}

async function run() {
  await init();
  const res = add(1, 2);
  updateContent(`1 + 2 = ${res}`);
  const res2 = greet("Wasm Tools");
  updateContent(res2);
}

function measureExecutionTime(fn) {
  return function (...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    const executionTime = end - start;
    return { result, executionTime };
  };
}

function handleTriggerFib() {
  // JS
  const { result: res3, executionTime: time3 } =
    measureExecutionTime(fibJS)(40);
  updateContent(`fibJS(40) = ${res3} in ${time3}ms`);

  // Wasm
  const { result: res4, executionTime: time4 } = measureExecutionTime(fib)(40);
  updateContent(`fibWasm(40) = ${res4} in ${time4}ms`);

  // Web Worker
  const worker = new Worker("./worker.js");
  const start = performance.now();
  worker.addEventListener("message", event => {
    const { data } = event;
    const { res } = data;
    const end = performance.now();
    updateContent(`fibWorker(40) = ${res} in ${end - start}ms`);
    worker.terminate();
  });
  worker.postMessage({ n: 40 });
}

run();
```

Open html file in browser

![application using webassembly for performance](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qte4ejckyhzdvd615w7g.png)

Visit https://wasm-web-performance.vercel.app to see the application live.

## Conclusion

In conclusion, WebAssembly is a powerful tool for optimizing web applications. It provides improved performance, portability, and security, making it an attractive option for web developers looking to optimize their applications. Rust is a great language for writing WebAssembly code, and `wasm-pack` makes it easy to compile and consume WebAssembly code in JavaScript.

## Source Code

The source code for this project can be found [here](https://github.com/siail/wasm-web-performance-test).

## Live Demo

[Rust WASM (wasm-web-performance.vercel.app)](https://wasm-web-performance.vercel.app/)
