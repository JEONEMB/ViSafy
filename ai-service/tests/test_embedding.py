from app.rag.embedding import LocalHashEmbedding


def test_local_embedding_is_deterministic_and_normalized() -> None:
    embedding = LocalHashEmbedding(dimensions=64)

    first = embedding.embed("E-9 외국인 체류자격 제한")
    second = embedding.embed("E-9 외국인 체류자격 제한")

    assert first == second
    assert round(sum(value * value for value in first), 6) == 1.0
