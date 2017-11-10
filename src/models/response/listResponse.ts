class ListResponse {
    data: any;

    constructor(data: any) {
        this.data = data;
    }
}

export { ListResponse };
(window as any).ListResponse = ListResponse;
