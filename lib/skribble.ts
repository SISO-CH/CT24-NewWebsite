// lib/skribble.ts
// Skribble API v2: https://api.skribble.com/v2/

interface SignatureRequestParams {
  title:       string;
  message?:    string;
  pdfBase64:   string;
  pdfName:     string;
  signerEmail: string;
  signerName:  string;
}

interface SignatureRequestResult {
  id:         string;
  signingUrl: string;
}

export async function createSignatureRequest(
  params: SignatureRequestParams
): Promise<SignatureRequestResult> {
  const username = process.env.SKRIBBLE_USERNAME;
  const apiKey   = process.env.SKRIBBLE_API_KEY;

  if (!username || !apiKey) {
    throw new Error("SKRIBBLE_USERNAME oder SKRIBBLE_API_KEY nicht konfiguriert");
  }

  const credentials = Buffer.from(`${username}:${apiKey}`).toString("base64");

  const res = await fetch("https://api.skribble.com/v2/signaturerequests", {
    method:  "POST",
    headers: {
      Authorization:  `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title:   params.title,
      message: params.message ?? "Bitte unterzeichnen Sie das beiliegende Dokument.",
      content: {
        name:         params.pdfName,
        content_type: "application/pdf",
        content:      params.pdfBase64,
      },
      signatures: [{
        signer_email_address: params.signerEmail,
        signer_name:          params.signerName,
      }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Skribble API ${res.status}: ${errText}`);
  }

  const data = await res.json() as {
    id:          string;
    signatures?: { signing_url?: string }[];
  };

  return {
    id:         data.id,
    signingUrl: data.signatures?.[0]?.signing_url ?? "",
  };
}
