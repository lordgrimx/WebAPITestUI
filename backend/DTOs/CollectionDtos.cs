using System.ComponentModel.DataAnnotations;

namespace WebTestUI.Backend.DTOs
{
    public class CollectionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int RequestCount { get; set; }
    }

    public class CreateCollectionDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public string Description { get; set; }
    }

    public class UpdateCollectionDto
    {
        public string Name { get; set; }

        public string Description { get; set; }
    }
}
