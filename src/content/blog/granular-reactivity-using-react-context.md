---
author: Abdullah Adeel
pubDatetime: 2023-06-12T15:22:00Z
modDatetime: 2024-01-13T20:06:38Z
title: We fixed react context 🚀. Using selectors for granular reactivity
slug: granular-reactivity-using-react-context
featured: true
draft: false
ogImage: /assets/blog/granular-reactivity-using-react-context.webp
tags:
  - react
  - typescript
description: In this article we will discuss how we can use selectors to achieve granular reactivity in react context using my library called textcon with a slightly advance but simple approach.
conicalUrl: https://dev.to/abdadeel/we-fixed-react-context-using-selectors-for-granular-reactivity-3743
---

![Using selectors for granular reactivity | abdadeel](@assets/blog/granular-reactivity-using-react-context.webp)

## Table of contents

## Introduction

## Using selectors with react context — textcon

Context in react was introduced to solve solely one problem. And that is prop drilling. But it has never been aimed to be used as a state manger. The primary reason is the render optimizations. Changes to the context value cause the whole child tree to re-render which is not ideal especially if state changes frequently and some of the child components are expensive to render. There are some workarounds but those too come with their own problems and limitations. State management libraries like redux has the concept of selectors from the beginning. Using selectors efficiently can increase the performance of react applications significantly.

In this article, I’ll introduce a library called **textcon** that I built on top of react context and support features like selectors and many more.

[https://github.com/siail/textcon](https://github.com/siail/textcon)

If you want to see more in depth explanation and use of the library. You can watch this video.

<div style="display:flex;align-items:center;justify-content:center;width:100%;overflow-x:auto">
<iframe width="560" height="315" src="https://www.youtube.com/embed/F2uJP5gnt60" frameborder="0" allowfullscreen></iframe>
</div>

A side note. Inspiration for this library came from [this](https://youtu.be/ZKlXqrcBx88) video of Jack Harrington. Highly recommend watching the video.

## Installation

```bash
# using npm
npm install textcon

# using yarn
yarn add textcon

# using pnpm
pnpm add textcon
```

## Usage

Using textcon is very similar to plain react context with the following general steps.

- Create context with default state and optionally actions.
- Wrap component tree with the provider.
- Use the provided hook to consume the state in components. In case of plain react context, this hook is `useContext` but `textcon` expose `useStore` with additional features. The main of which is the support of selectors.

let’s say we’re building a simple counter app. But instead of one counter, you’ve two counters that you need to keep track two counters. `firstCounter` and `secondCounter`. Keep that in mind, out default state would look something like this.

```tsx
const defaultState = {
  firstCounter: 0,
  secondCounter: 0,
};
```

Let’s use `textcon` to create context.

```tsx
import { createContextStore } from "textcon";

const { Provider, useStore } = createContextStore({
  firstCounter: 0,
  secondCounter: 0,
});
```

Simply import `createContextStore` from `textcon` and provide it the default state value.

This functional will return object. Let’s destruct it to use;

- **Provider** The component that needs to be wrapped around the component tree where you want to consume the state.
- **useStore** hook: This hook is use to access the state stored in the context.

Now lets wrap our parent component (`<App/ >`) with the provider.

```tsx
// ...
function App() {
  return (
    <Provider>
      <div className="App">Hello, World!</div>
    </Provider>
  );
}

export default App;
```

Now, let’s say we’ve two components.

- A component to display the value of `firstCounter`
- Another component to update the value of `firstCounter`

```tsx
// ...
const Counter1Display = () => {
  const { get: firstCounter } = useStore(state => state.firstCounter);

  return <div>Counter 1: {firstCounter}</div>;
};

const Counter1Control = () => {
  const { set } = useStore(() => false);

  return (
    <button
      onClick={() => {
        set(prev => ({
          ...prev,
          firstCounter: prev.firstCounter + 1,
        }));
      }}
    >
      Increment Counter 1
    </button>
  );
};
// ...
```

In this snippet, we defined the two required components. `Counter1Display` component is responsible for rendering the current value of the `firstCounter` stored inside the context. `Counter1Control` component renders a button that when clicked increment the value of first counter by 1.

`useStore` hook works pretty similar to how `useSelector` hook works in redux. The first argument passed to this hooks is a selector function that can be used to select whole state (default) or part of the state the component is interested in.

In case of `Counter1Display` component, we’re only interested in `firstCounter` value since that’s the value this component is going to display.

```tsx
// ...
const { get: firstCounter } = useStore(state => state.firstCounter);
// ...
```

Unlike redux’s `useSelector` hooks, `useStore` by `textcon` returns an object with a `get` property and `set` setter function property. `get` give access to the value returned by the selector provided to `useSelector`. While `set` as can use used just like `useState` hook from react to update the state stored in context.

One thing that you might’ve noticed is the callback function passed to `useStore` in `Counter1Control` component.

```tsx
// ...
const { set } = useStore(() => false);
// ...
```

Since `Counter1Control` component does not render any reactive state, a callback returning static value can be passed as selector to prevent re-renders.

Now, let’s render out counter components.

```tsx
function App() {
  return (
    <Provider>
      <div className="App">
        <Counter1Display />
        <Counter1Control />
      </div>
    </Provider>
  );
}

export default App;
```

In the same way, state for second counter can be accessed and updated in the context.

## Using actions

Actions are predefined functions to update the state object stored inside the context. Actions can be provided in an object as second argument to the `createContextStore` function.

Let’s add actions to update the counter values.

```tsx
import { createContextStore, ActionablePayload } from "textcon";

const { Provider, useStore, useActions } = createContextStore(
  {
    firstCounter: 0,
    secondCounter: 0,
  },
  {
    incrementFirstCounter: ({ set, get }) => {
      set(prev => ({
        ...prev,
        firstCounter: get().firstCounter + 1, // or prev.firstCounter + 1
      }));
    },
    decrementFirstCounter: ({ set, get }) => {
      set(prev => ({
        ...prev,
        firstCounter: get().firstCounter - 1, // or prev.firstCounter + 1
      }));
    },
    incrementBy: ({ set, get }, action: ActionablePayload<number>) => {
      set(prev => ({
        ...prev,
        firstCounter: get().firstCounter + action.payload,
      }));
    },
  }
);
```

Actions can be triggered `using` `useActions` hook expose by the `createContextStore` function.

Let’s update our `Counter1Control` component to update use actions to update the state value store in context.

```tsx
// ...
const Counter1Control = () => {
  const { incrementFirstCounter } = useActions();

  return <button onClick={incrementFirstCounter}>Increment Counter 1</button>;
};
// ...
```

Much cleaner! In the same way,

```tsx
// ...
const Counter1ControlByTen = () => {
  const { incrementBy } = useActions();

  return (
    <button onClick={() => incrementBy(10)}>Increment Counter 1 by 10</button>
  );
};
// ...
```

`textcon` comes with other useful features like global state persist and subscribing to state changes outside the react components.

[https://github.com/siail/textcon](https://github.com/siail/textcon)

🚀
