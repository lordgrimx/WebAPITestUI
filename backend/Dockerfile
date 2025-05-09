FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WebTestUI.Backend.csproj", "."]
RUN dotnet restore "WebTestUI.Backend.csproj"
COPY . .
RUN dotnet publish "WebTestUI.Backend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Ensure the migrations directory exists and is set up
RUN mkdir -p /app/Migrations

# Set environment variables for ASP.NET Core
ENV ASPNETCORE_URLS=http://+:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

# Ensure k6 is available (if needed)
RUN apt-get update && apt-get install -y gnupg2 && \
    apt-get install -y dirmngr --install-recommends && \
    gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C780D0BDB1A69C86 && \
    echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && \
    apt-get install -y k6

# Command to run the application
CMD dotnet WebTestUI.Backend.dll
