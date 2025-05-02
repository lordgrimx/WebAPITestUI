FROM mcr.microsoft.com/mssql/server:2022-latest

# Environment variables for SQL Server
ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=asker123

# Expose the SQL Server port
EXPOSE 1433

# Create the backup directory
RUN mkdir -p /var/opt/mssql/backup

# Copy the database backup file
COPY database /var/opt/mssql/backup/

# Change to root user to run sqlcmd
USER root

# Configure and run SQL Server, then restore the database
RUN (/opt/mssql/bin/sqlservr --accept-eula & ) | grep -q "Service Broker manager has started" && \
    /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "${SA_PASSWORD}" \
    -Q "RESTORE DATABASE [WebTestUIDb] FROM DISK = '/var/opt/mssql/backup/database' \
    WITH MOVE 'WebTestUIDb' TO '/var/opt/mssql/data/WebTestUIDb.mdf', \
    MOVE 'WebTestUIDb_log' TO '/var/opt/mssql/data/WebTestUIDb_log.ldf'"

# Switch back to mssql user and start SQL Server
USER mssql
CMD ["/opt/mssql/bin/sqlservr"]
