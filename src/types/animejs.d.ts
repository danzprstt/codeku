declare module 'animejs' {
  type FunctionBasedParameter = (element: Element, index: number, length: number) => number;
  type AnimeCallbackFunction = (anim: AnimeInstance) => void;

  interface AnimeParams {
    targets?: any;
    duration?: number | FunctionBasedParameter;
    delay?: number | FunctionBasedParameter;
    easing?: string;
    round?: number | boolean;
    loop?: number | boolean;
    direction?: 'normal' | 'reverse' | 'alternate';
    autoplay?: boolean;
    begin?: AnimeCallbackFunction;
    complete?: AnimeCallbackFunction;
    update?: AnimeCallbackFunction;
    [AnyAnimatedProperty: string]: any;
  }

  interface AnimeInstance {
    play(): void;
    pause(): void;
    restart(): void;
    reverse(): void;
    seek(time: number): void;
    finished: Promise<void>;
    duration: number;
    currentTime: number;
    progress: number;
    paused: boolean;
    completed: boolean;
    began: boolean;
  }

  interface AnimeTimelineInstance extends AnimeInstance {
    add(params: AnimeParams, timeOffset?: string | number): AnimeTimelineInstance;
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance;
    timeline(params?: AnimeParams): AnimeTimelineInstance;
    stagger(
      value: number | string | [number | string, number | string],
      options?: {
        start?: number | string;
        from?: number | 'first' | 'last' | 'center';
        direction?: 'normal' | 'reverse';
        easing?: string;
        grid?: [number, number];
        axis?: 'x' | 'y';
      }
    ): FunctionBasedParameter;
    set(targets: any, params: AnimeParams): void;
    get(targets: any, prop: string, unit?: string): string | number;
    remove(targets: any): void;
    running: AnimeInstance[];
    speed: number;
    random(min: number, max: number): number;
  }

  const anime: AnimeStatic;
  export = anime;
}
