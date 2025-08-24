export interface Manifest {
    schemaVersion: number
    name: string
    tag: string
    architecture: string
    fsLayers: FsLayer[]
    history: History[]
    signatures: Signature[]
}

export interface FsLayer {
    blobSum: string
}

export interface History {
    v1Compatibility: string
}

export interface Signature {
    header: Header
    signature: string
    protected: string
}

export interface Header {
    jwk: Jwk
    alg: string
}

export interface Jwk {
    crv: string
    kid: string
    kty: string
    x: string
    y: string
}
