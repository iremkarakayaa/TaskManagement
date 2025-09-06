using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repository
{
    public class TaskManagementDbContextFactory : IDesignTimeDbContextFactory<TaskManagementDbContext>
    {
        public TaskManagementDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<TaskManagementDbContext>();
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=TaskManagementDb;Username=postgres;Password=yourpassword");
            return new TaskManagementDbContext(optionsBuilder.Options);
        }
    }
}
