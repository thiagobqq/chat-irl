using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace src.Impl.Dtos
{
    public class CreateGroupDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public List<string> Users { get; set; } = new List<string>();

    }

    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public DateTime DataCriacao { get; set; }

        public List<GroupMemberDto> Members { get; set; } = new List<GroupMemberDto>();
    }
}