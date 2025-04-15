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
        public DbSet<EnvironmentVariable> Environments { get; set; }

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
                .OnDelete(DeleteBehavior.ClientSetNull); // Changed from SetNull to ClientSetNull

            // History
            modelBuilder.Entity<History>()
                .HasOne(h => h.User)
                .WithMany(u => u.HistoryEntries)
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<History>()
                .HasOne(h => h.Request)
                .WithMany(r => r.HistoryEntries)
                .HasForeignKey(h => h.RequestId)
                .IsRequired(false)  // Optional relationship - history can exist for ad-hoc requests
                .OnDelete(DeleteBehavior.SetNull);            // Environment
            modelBuilder.Entity<EnvironmentVariable>()
                .HasOne(e => e.User)
                .WithMany(u => u.Environments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Add indexes
            modelBuilder.Entity<Collection>()
                .HasIndex(c => new { c.UserId, c.Name });

            modelBuilder.Entity<Request>()
                .HasIndex(r => r.CollectionId);

            modelBuilder.Entity<History>()
                .HasIndex(h => h.Timestamp);

            modelBuilder.Entity<EnvironmentVariable>()
                .HasIndex(e => new { e.UserId, e.IsActive });
        }
    }
}
