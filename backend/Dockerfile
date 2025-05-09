FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WebTestUI.Backend.csproj", "."]
RUN dotnet restore "WebTestUI.Backend.csproj"
COPY . .
RUN dotnet publish "WebTestUI.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
EXPOSE 443

# Install K6 using alternative method
RUN apt-get update && apt-get install -y ca-certificates gnupg curl && \
    curl -L https://github.com/grafana/k6/releases/download/v0.46.0/k6-v0.46.0-linux-amd64.tar.gz -o k6.tar.gz && \
    tar xzf k6.tar.gz && \
    mv k6-v0.46.0-linux-amd64/k6 /usr/local/bin/ && \
    rm -rf k6-v0.46.0-linux-amd64 k6.tar.gz

ENTRYPOINT ["dotnet", "WebTestUI.Backend.dll"]
