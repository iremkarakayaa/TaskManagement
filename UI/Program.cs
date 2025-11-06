using BL.Interfaces;
using BL.Services;
using DataAccessLayer;
using DataAccessLayer.Interfaces;
using DataAccessLayer.Repository;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace UI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // API Controller'lar
            builder.Services.AddControllers();

            // PostgreSQL ba�lant�s�
            builder.Services.AddDbContext<TaskManagementDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Servisleri DI container'a ekleme
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IBoardService, BoardService>();
            builder.Services.AddScoped<IListService, ListService>();
            builder.Services.AddScoped<ICardService, CardService>();
            builder.Services.AddScoped<IListRepository, ListRepository>();
            builder.Services.AddScoped<IBoardRepository, BoardRepository>();
            builder.Services.AddScoped<ICardRepository, CardRepository>();
            builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

            // Swagger servisleri
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS ayar�
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReact",
                    policy => policy.WithOrigins("http://localhost:5173") // React dev server adresi
                                    .AllowAnyMethod()
                                    .AllowAnyHeader());
            });

            var app = builder.Build();

            app.UseCors("AllowReact");

            // Development ortamında detaylı hata bilgisi
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseAuthorization();

            // API route
            app.MapControllers();

            app.Run();
        }
    }
}
