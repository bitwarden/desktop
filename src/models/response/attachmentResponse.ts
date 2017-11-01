class AttachmentResponse {
    id: string;
    url: string;
    fileName: string;
    size: number;
    sizeName: string;

    constructor(response: any) {
        this.id = response.Id;
        this.url = response.Url;
        this.fileName = response.FileName;
        this.size = response.Size;
        this.sizeName = response.SizeName;
    }
}

export { AttachmentResponse };
(window as any).AttachmentResponse = AttachmentResponse;
