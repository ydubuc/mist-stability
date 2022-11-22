export default interface GenerateImagesResponse {
    data: GenerateImageData[];
}

export interface GenerateImageData {
    base64: string;
    seed: string;
}
