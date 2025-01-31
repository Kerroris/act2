#### Comando para subir a cloud function

```bash

gcloud functions deploy uteq-login --entry-point=login --runtime=nodejs22 --trigger-http --allow-unauthenticated --set-env-vars MONGODB_URI="mongodb+srv://kerroris:Alondrabb11$@cluster0.6ngdm.mongodb.net/sample_airbnb?retryWrites=true&w=majority&appName=Cluster0"

```