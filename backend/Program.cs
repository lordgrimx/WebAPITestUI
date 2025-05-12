using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models; // Already present
using System.Text;
using WebTestUI.Backend.Data;
using WebTestUI.Backend.Data.Entities; // Add this for ApplicationUser
using WebTestUI.Backend.Services;
using WebTestUI.Backend.Services.Interfaces;
using dotenv.net; // Add dotenv support
// Add Swashbuckle using directives if they are missing implicitly
// using Swashbuckle.AspNetCore.SwaggerGen;
// using Swashbuckle.AspNetCore.SwaggerUI;

// Load environment variables from .env.local file
DotEnv.Fluent()
    .WithEnvFiles(".env.local")
    .WithTrimValues()
    .WithProbeForEnv(probeLevelsToSearch: 5)
    .Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add SignalR for real-time notifications
builder.Services.AddSignalR();

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var usePostgreSQL = builder.Configuration.GetValue<bool>("UsePostgreSQL", true); // Varsayılan olarak PostgreSQL kullan
    
    if (usePostgreSQL)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        
        // Check if connection string is a PostgreSQL URI (starts with postgres://)
        if (connectionString?.StartsWith("postgres://") == true)
        {
            try 
            {
                // Parse the connection string to convert from URI format to key=value format
                var uri = new Uri(connectionString);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo[0];
                var password = userInfo.Length > 1 ? userInfo[1] : "";
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');
                
                // Build the new connection string in the format Npgsql expects
                connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
                
                Console.WriteLine($"Converted PostgreSQL connection string format. Using: Host={host};Port={port};Database={database};Username={username};Password=******;");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to parse PostgreSQL URI: {ex.Message}");
                // If parsing fails, continue with the original connection string
            }
        }
        
        options.UseNpgsql(
            connectionString,
            b => b.MigrationsAssembly("WebTestUI.Backend")
        );
    }
    else
    {
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            b => b.MigrationsAssembly("WebTestUI.Backend")
        );
    }
});

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidAudience = builder.Configuration["JWT:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT:Key is not configured")))
    };
    
    // Configure JwtBearer for SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            
            // If the request is for the hub
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && 
                path.StartsWithSegments("/hubs/notifications"))
            {
                // Read the token from the query string
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        // AllowedOrigins ayarından gelen origin'leri veya varsayılan olarak localhost ve Vercel domain'lerini kabul et
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[] { "http://localhost:3000" };
        
        // Vercel URL'lerini ekle
        var originList = new List<string>(allowedOrigins);
        originList.Add("https://client-d597m7fo4-lordgrimxs-projects.vercel.app");
        originList.Add("https://client-helykzfuh-lordgrimxs-projects.vercel.app");
        originList.Add("https://client-nu-orcin-64.vercel.app");
        // Herhangi bir Vercel domainini kabul etmek için (*.vercel.app) burada regex kullanamıyoruz, 
        // bu yüzden bilinen tüm domainleri eklemeliyiz
        
        policy
            .WithOrigins(originList.ToArray())
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// HTTP Client
builder.Services.AddHttpClient("ApiClient", client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "WebTestUI-Backend");
    client.Timeout = TimeSpan.FromSeconds(60); // 60 saniye timeout
});

// Add Logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole()
           .AddDebug()
           .SetMinimumLevel(LogLevel.Warning) // This will hide Information level logs
           .AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning); // This will specifically filter EF Core logs
});

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICollectionService, CollectionService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IRequestService, RequestService>();
builder.Services.AddScoped<IEnvironmentService, EnvironmentService>();
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IK6TestService, K6TestService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISharedDataService, SharedDataService>();
builder.Services.AddScoped<IFaqService, FaqService>();
builder.Services.AddScoped<ISupportTicketService, SupportTicketService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<IHelpDocumentService, HelpDocumentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebTestUI API", Version = "v1" });

    // Configure Swagger to use JWT authentication
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin");

// Enable static file serving (for wwwroot)
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<WebTestUI.Backend.Hubs.NotificationHub>("/hubs/notifications");

// Seed roles and default environment
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>(); // Optional: If you need UserManager too
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    // Ensure database is created and migrations are applied
    try
    {
        logger.LogInformation("Attempting to ensure that database exists and is up to date...");
        
        // First ensure database exists
        bool dbExists = dbContext.Database.CanConnect();
        logger.LogInformation($"Database connection test: {(dbExists ? "Successful" : "Failed")}");
        
        if (!dbExists)
        {
            logger.LogInformation("Creating database...");
            dbContext.Database.EnsureCreated();
        }
        
        // Then apply migrations
        logger.LogInformation("Applying migrations...");
        dbContext.Database.Migrate();
        logger.LogInformation("Migrations applied successfully.");
        
        // Verify if migrations worked by checking if a few key tables exist
        try 
        {
            // Select count to verify table exists
            var envCount = dbContext.Environments.Count();
            logger.LogInformation($"Table check: Environments table exists, count: {envCount}");
        }
        catch (Exception ex)
        {
            logger.LogError($"Table verification failed. Environments table may not exist: {ex.Message}");
            
            // Render.com'da veritabanını sıfırlamaya çalışmak yetki hatası verir
            // Bu nedenle daha güvenli bir yöntem kullanacağız
            logger.LogWarning("Migration appears to have failed. Attempting schema creation...");
            try 
            {
                // Doğrudan SQL komutları kullanarak şema ve tabloları oluşturmayı deneyelim
                // NOT: Bu yöntem daha az güvenli, ancak hızlı bir çözüm sağlayabilir
                logger.LogInformation("Creating schema using EnsureCreated...");
                
                // EnsureCreated ile şemayı oluştur ama mevcut tabloları silme
                bool created = dbContext.Database.EnsureCreated();
                logger.LogInformation($"Database schema created: {created}");
                
                if (!created)
                {
                    // Şema mevcut, migration'ları tekrar uygulamayı deneyelim
                    logger.LogInformation("Schema exists, reapplying migrations...");
                    dbContext.Database.Migrate();
                }
            }
            catch (Exception recreateEx)
            {
                logger.LogError($"Failed to create database schema: {recreateEx.Message}");
                logger.LogWarning("You may need to manually create tables or reset the database from Render.com dashboard");
                // Hatayı yeniden fırlatmıyoruz - uygulama çalışmaya devam etsin ama log kayıtlarına uyarı ekleyelim
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating or setting up the database.");
        
        // Try to provide more context about the error
        if (ex.InnerException != null)
        {
            logger.LogError($"Inner Exception: {ex.InnerException.Message}");
        }
        
        throw; // Re-throw to ensure application stops with error
    }

    // Check for default environment
    if (!dbContext.Environments.Any())
    {
        logger.LogInformation("Creating default environment...");
        dbContext.Environments.Add(new EnvironmentConfig
        {
            Name = "Default",
            IsActive = true,
            Variables = "{}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });
        dbContext.SaveChanges();
    }

    string[] roleNames = { "ADMIN", "USER" };
    IdentityResult roleResult;

    foreach (var roleName in roleNames)
    {
        var roleExist = await roleManager.RoleExistsAsync(roleName);
        if (!roleExist)
        {
            // Create the roles and seed them to the database
            roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
            // Log errors if needed: if (!roleResult.Succeeded) { ... }
        }
    }

    // Optional: Create a default admin user if it doesn't exist
    var adminEmail = builder.Configuration["DefaultAdmin:Email"] ?? "admin@example.com";
    var adminPassword = builder.Configuration["DefaultAdmin:Password"] ?? "Admin@123"; // Use a strong password from config!
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            Name = "Admin User",
            EmailConfirmed = true,
            NotificationPreference = new NotificationPreference
                {
                    // Default notification preferences
                    ApiUpdatesEnabled = true,
                    RequestErrorsEnabled = true,
                    TestFailuresEnabled = true,
                    MentionsEnabled = true,
                    EmailCommentsEnabled = true,
                    EmailSharedApisEnabled = true,
                    EmailSecurityAlertsEnabled = true,
                    NewsletterEnabled = true,
                    SlackEnabled = true,
                    DiscordEnabled = true
                } // Assuming admin email is confirmed
        };
        var createAdminResult = await userManager.CreateAsync(adminUser, adminPassword);
        if (createAdminResult.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "ADMIN");
        }
        // Log errors if needed: else { ... }
    }
}


app.Run();
