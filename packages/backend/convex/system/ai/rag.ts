import { components } from "../../_generated/api";
import { RAG } from "@convex-dev/rag";
import { createVoyage } from "voyage-ai-provider";

const voyage = createVoyage({
    apiKey: process.env.VOYAGE_API_KEY,
});

    const rag = new RAG(components.rag, {
        textEmbeddingModel: voyage.embeddingModel("voyage-4-lite"),
        embeddingDimension: 1024
    })


export default rag