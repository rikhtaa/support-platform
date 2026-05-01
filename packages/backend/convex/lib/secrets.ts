const INFISICAL_API = "https://app.infisical.com/api";


function getHeaders() {
    return {
        "Authorization": `Bearer ${process.env.INFISICAL_SERVICE_TOKEN!}`,
        "Content-Type": "application/json"
    };
}

export async function getSecretValue<T = Record<string, unknown>>(
    secretName: string
): Promise<T | null> {
    try {
        const res = await fetch(
            `${INFISICAL_API}/v3/secrets/raw/${secretName}?workspaceId=${process.env.INFISICAL_PROJECT_ID}&environment=dev&secretPath=/`,
            { headers: getHeaders() }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return JSON.parse(data.secret.secretValue) as T;
    } catch {
        return null;
    }
}

export async function upsertSecret(
    secretName: string,
    secretValue: Record<string, unknown>
): Promise<void> {
    const body = JSON.stringify({
        secretKey: secretName,
        secretValue: JSON.stringify(secretValue),
        workspaceId: process.env.INFISICAL_PROJECT_ID,
        environment: "dev",
        secretPath: "/"
    });

    const res = await fetch(`${INFISICAL_API}/v3/secrets/raw/${secretName}`, {
        method: "POST",
        headers: getHeaders(),
        body
    });
    
    if (!res.ok) {
        await fetch(`${INFISICAL_API}/v3/secrets/raw/${secretName}`, {
            method: "PATCH",
            headers: getHeaders(),
            body
        });
    }
}

export function parseSecretString<T = Record<string, unknown>>(
    secret: { secretValue: string } | null
): T | null {
    if (!secret?.secretValue) return null;
    try {
        return JSON.parse(secret.secretValue) as T;
    } catch {
        return null;
    }
}