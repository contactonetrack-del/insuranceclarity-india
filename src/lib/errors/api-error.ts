/**
 * Standardized Error class that implements the RFC 7807 (Problem Details for HTTP APIs)
 * Used to provide consistent, machine-readable error responses across the platform.
 */
export class ApiError extends Error {
    public statusCode: number;
    public details?: unknown;
    public type?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        details?: unknown,
        type: string = 'about:blank'
    ) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.details = details;
        this.type = type;

        // Restore prototype chain path for correct instanceOf checks in TypeScript/ES6 Target
        Object.setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Serializes the error into a payload mapping to RFC 7807.
     */
    public toJSON() {
        if (this.details) {
            return {
                type: this.type,
                title: this.name,
                status: this.statusCode,
                detail: this.message,
                extensions: this.details,
            };
        }
        return {
            type: this.type,
            title: this.name,
            status: this.statusCode,
            detail: this.message,
        };
    }
}
