

from minio import Minio
from django.conf import settings
import io


minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_USE_SECURE
)


def upload_to_minio(bucket_name, object_name, data_stream, length, content_type='application/octet-stream'):
    """
    Fonction générique pour uploader un flux de données vers MinIO.
    Elle crée le bucket s'il n'existe pas.
    """
    # Vérifier si le bucket existe, sinon le créer.
    found = minio_client.bucket_exists(bucket_name)
    if not found:
        minio_client.make_bucket(bucket_name)
        print(f"Bucket '{bucket_name}' créé avec succès.")

    # Uploader les données avec le content_type correct
    minio_client.put_object(
        bucket_name,
        object_name,
        data_stream,
        length,
        content_type=content_type
    )
    print(f"'{object_name}' a été uploadé avec succès dans le bucket '{bucket_name}'.")