declare namespace org {

  export namespace greenrobot {

    export namespace eventbus {

      export class EventBus {
        public static getDefault(): EventBus;
        public post(event: java.lang.Object): void;
        public isRegistered(subscriber: java.lang.Object): boolean;
        public register(subscriber: java.lang.Object): void;
        public unregister(subscriber: java.lang.Object): void;
      }

      export class Subscribe {}
    }
  }
}