/**
 * Workaround for inquirer-search-list to print value name
 * on terminal but retrieve the actual value of the user's choice
 */
export class WorkaroundChoice<T extends { name: string }> {
    name: string;
    value: T;
    constructor(name: string, value: T) {
        this.name = name;
        this.value = value;
    }

    toString(): string {
        return this.name;
    }
}