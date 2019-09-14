class Hello {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    hello(): void {
        console.log(`Hello ${this.name}!`);
    }
}

export { Hello };
