using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Identity.Client;
using Microsoft.Net.Http.Headers;

namespace src.Core.Models
{
    public class Group
    {
        public int Id { get; set; }
        public string Nome { get; set; } = String.Empty;
        public string? Descricao { get; set; }
        public DateTime DataCriacao { get; set; }
        public ICollection<AppUser> Users { get; set; } = new List<AppUser>();
    }
}