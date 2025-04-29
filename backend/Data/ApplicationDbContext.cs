// filepath: d:\Projects\WebAPITestUI-semih.net1\backend\Data\ApplicationDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebTestUI.Backend.Data.Entities;

namespace WebTestUI.Backend.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Collection> Collections { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<History> HistoryEntries { get; set; }
        public DbSet<EnvironmentConfig> Environments { get; set; }
        public DbSet<K6Test> K6Tests { get; set; }
        public DbSet<SharedData> SharedData { get; set; } // Add DbSet for SharedData

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints

            // Collection
            modelBuilder.Entity<Collection>()
                .HasOne(c => c.User)
                .WithMany(u => u.Collections)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Collection>()
                .HasOne(c => c.Environment)
                .WithMany(e => e.Collections)
                .HasForeignKey(c => c.EnvironmentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction); // Changed from SetNull to NoAction to avoid cascade cycles

            // Request
            modelBuilder.Entity<Request>()
                .HasOne(r => r.User)
                .WithMany(u => u.Requests)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Request>()
                .HasOne(r => r.Collection)
                .WithMany(c => c.Requests)
                .HasForeignKey(r => r.CollectionId)
                .IsRequired(false)  // Optional relationship - a request can exist without a collection
                .OnDelete(DeleteBehavior.NoAction); // Changed from SetNull or ClientSetNull to NoAction to avoid cascade cycles

            modelBuilder.Entity<Request>()
                .HasOne(r => r.Environment)
                .WithMany(e => e.Requests)
                .HasForeignKey(r => r.EnvironmentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction); // Changed from SetNull to NoAction to avoid cascade cycles

            // History
            modelBuilder.Entity<History>()
                .HasOne(h => h.User)
                .WithMany(u => u.HistoryEntries)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<History>()
                .HasOne(h => h.Request)
                .WithMany(r => r.HistoryEntries)
                .HasForeignKey(h => h.RequestId)
                .IsRequired(false)  // Optional relationship - history can exist for ad-hoc requests
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<History>()
                .HasOne(h => h.Environment)
                .WithMany(e => e.HistoryEntries)
                .HasForeignKey(h => h.EnvironmentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction); // Changed to NoAction to avoid cascade cycles

            // Environment
            modelBuilder.Entity<EnvironmentConfig>()
                .HasOne(e => e.User)
                .WithMany(u => u.Environments)
                .HasForeignKey(e => e.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
