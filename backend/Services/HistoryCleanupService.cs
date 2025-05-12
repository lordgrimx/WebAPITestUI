using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data;

namespace WebTestUI.Backend.Services;

public class HistoryCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<HistoryCleanupService> _logger;
    private readonly TimeSpan _period = TimeSpan.FromMinutes(10); // Run every 10 minutes

    public HistoryCleanupService(IServiceProvider serviceProvider, ILogger<HistoryCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("History Cleanup Service is starting.");

        // Use PeriodicTimer for better handling of long-running tasks
        using var timer = new PeriodicTimer(_period);

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await DoWorkAsync(stoppingToken);
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("History Cleanup Service is stopping.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred in History Cleanup Service.");
        }
    }

    private async Task DoWorkAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("History Cleanup Service is running at: {time}", DateTimeOffset.Now);

        try
        {
            // Create a new scope to retrieve scoped services like ApplicationDbContext
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Find history entries with null EnvironmentId
            var entriesToDelete = await dbContext.HistoryEntries
                .Where(h => h.EnvironmentId == null)
                .ToListAsync(stoppingToken); // Pass the cancellation token

            if (entriesToDelete.Any())
            {
                _logger.LogInformation("Found {Count} history entries with null EnvironmentId to delete.", entriesToDelete.Count);

                dbContext.HistoryEntries.RemoveRange(entriesToDelete);
                var deletedCount = await dbContext.SaveChangesAsync(stoppingToken); // Pass the cancellation token

                _logger.LogInformation("Successfully deleted {Count} history entries with null EnvironmentId.", deletedCount);
            }
            else
            {
                _logger.LogInformation("No history entries with null EnvironmentId found to delete.");
            }
        }
        catch (OperationCanceledException)
        {
            // Ignore cancellation exceptions during the operation
            _logger.LogInformation("History cleanup operation was canceled.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while cleaning up history entries.");
        }
    }

    public override Task StopAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("History Cleanup Service is stopping.");
        return base.StopAsync(stoppingToken);
    }
} 