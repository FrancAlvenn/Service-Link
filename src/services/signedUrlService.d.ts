export interface SignedUrlRequestPayload {
  fileKey: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresIn: number;
  fileKey: string;
}

