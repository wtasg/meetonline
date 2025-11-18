# Web APIs

## `window.requestAnimationFrame()`

- Requests browser to call user function before next repaint.
- Tries to get the user function executed as many times as the refresh rate
- It may pause execution if tab is in the background or hidden
- one shot
- returns `unsigned long` integer value as the request id for callback which can be passed to `window.cancelAnimationFrame()`
	- id: per window incrementing counter
	- might overflow back to 0
	- implementation dependent; ymmv
	- 

> [!Note]
> User function must call requestAnimationFrame again if it wishes to render another frame. RAF() is one shot


```javascript
requestAnimationFrame(callback)
```



----

- [MDN RAF](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN High Res Time Stamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp)
- [mdn performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
- [mdn animation timeline](https://developer.mozilla.org/en-US/docs/Web/API/AnimationTimeline)
- [mdn web animations apis](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
