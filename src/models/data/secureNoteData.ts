class SecureNoteData {
    type: number; // TODO: enum

    constructor(data: any) {
        this.type = data.Type;
    }
}

export { SecureNoteData };
(window as any).SecureNoteData = SecureNoteData;
