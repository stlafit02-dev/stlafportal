# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# LibreOffice headless renders uploaded .docx templates to PDF (DocxToPdfConverter.cs).
RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice-writer \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "STLAF.Api.dll"]

ENV DOTNET_USE_POLLING_FILE_WATCHER=false