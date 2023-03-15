import * as THREE from "three";

// interface MouseInterface {
//     left: boolean;
//     right: boolean;
//     pos: THREE.Vector2;
//     delta: THREE.Vector2;
//     isPointerLock: boolean;
// }

interface KeysInterface {
  " ": boolean; // spacebar
  "`": boolean;
  Shift: boolean;
  Control: boolean;
  Alt: boolean;
  F1: boolean;
  F2: boolean;
  F3: boolean;
  F4: boolean;
  F5: boolean;
  F6: boolean;
  F7: boolean;
  F8: boolean;
  "1": boolean;
  "2": boolean;
  "3": boolean;
  "4": boolean;
  "5": boolean;
  "6": boolean;
  "7": boolean;
  "8": boolean;
  "9": boolean;
  "10": boolean;
  q: boolean;
  w: boolean;
  e: boolean;
  r: boolean;
  t: boolean;
  y: boolean;
  u: boolean;
  i: boolean;
  o: boolean;
  p: boolean;
  a: boolean;
  s: boolean;
  d: boolean;
  f: boolean;
  g: boolean;
  h: boolean;
  j: boolean;
  k: boolean;
  l: boolean;
  z: boolean;
  x: boolean;
  c: boolean;
  v: boolean;
  b: boolean;
  n: boolean;
  m: boolean;
  arrowup: boolean;
  arrowdown: boolean;
}

/**
 * Controls singleton class
 */
class Input {
  // mouse : MouseInterface;
  keys: KeysInterface;

  constructor() {
    // this.initMouseListener();
    this.initKeyListener();
  }

  GetKey(key: string): boolean {
    return this.keys[key];
  }

  GetKeyInteger(key: string): number {
    return this.GetKey(key) ? 1 : -1;
  }

  initKeyListener(): void {
    this.keys = {
      " ": false,
      "`": false,
      Shift: false,
      Control: false,
      Alt: false,
      F1: false,
      F2: false,
      F3: false,
      F4: false,
      F5: false,
      F6: false,
      F7: false,
      F8: false,
      "1": false,
      "2": false,
      "3": false,
      "4": false,
      "5": false,
      "6": false,
      "7": false,
      "8": false,
      "9": false,
      "10": false,
      q: false,
      w: false,
      e: false,
      r: false,
      t: false,
      y: false,
      u: false,
      i: false,
      o: false,
      p: false,
      a: false,
      s: false,
      d: false,
      f: false,
      g: false,
      h: false,
      j: false,
      k: false,
      l: false,
      z: false,
      x: false,
      c: false,
      v: false,
      b: false,
      n: false,
      m: false,
      arrowup: false,
      arrowdown: false,
    };

    const keyChangeHandler = (evt: KeyboardEvent) => {
      let toggle: boolean = evt.type === "keydown" ? true : false;
      this.keys[evt.key.toLocaleLowerCase()] = toggle;
    };

    window.addEventListener("keydown", (evt: KeyboardEvent) =>
      keyChangeHandler(evt)
    );
    window.addEventListener("keyup", (evt: KeyboardEvent) =>
      keyChangeHandler(evt)
    );
  }
}

const input = new Input();
export default input;
