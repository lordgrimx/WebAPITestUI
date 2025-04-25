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

# Ensure k6 is available (if needed)
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg2 dirmngr && \
    gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C780D0BDB1A69C86 && \
    gpg --export C780D0BDB1A69C86 | gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && \
    apt-get install -y k6

ENTRYPOINT ["dotnet", "WebTestUI.Backend.dll"]
