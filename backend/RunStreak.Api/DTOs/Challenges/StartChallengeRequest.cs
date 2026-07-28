using System;
using System.ComponentModel.DataAnnotations;

namespace RunStreak.Api.DTOs.Challenges;

public class StartChallengeRequest
{
    [Required]
    public Guid ChallengeId { get; set; }
}
