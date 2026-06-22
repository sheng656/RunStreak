namespace RunStreak.Api.Models;

/// <summary>
/// Persisted refresh token for the split-storage JWT auth flow.
/// Raw tokens are NEVER stored — only SHA-256 hashes.
/// See specs/decisions/001-split-storage-jwt.md for the full design rationale.
/// </summary>
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }

    /// <summary>
    /// SHA-256 hash of the raw refresh token value.
    /// Stored hashed so a DB leak doesn't hand out usable tokens.
    /// </summary>
    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Set when the token is rotated or revoked. null = still valid.
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Hash of the token that replaced this one on rotation.
    /// Enables detection of token reuse/replay: if a revoked token is
    /// presented, the entire token family should be invalidated.
    /// </summary>
    public string? ReplacedByTokenHash { get; set; }

    // Navigation property
    public User User { get; set; } = null!;

    /// <summary>True if the token is within its validity window and not revoked.</summary>
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}
