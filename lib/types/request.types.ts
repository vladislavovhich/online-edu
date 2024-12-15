export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
}

export type FileType = {
    content: Buffer;
    name: string;
    size: number;
};

export type RequestRead = {
    headers: Record<string, string>;
    body: Buffer | null;
    raw: string;
};
