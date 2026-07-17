// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title  SpectraProfile — lean on-chain profile registry
/// @notice One profile per address. msg.sender is the implicit key; no admin surface.
contract SpectraProfile {

    // ── Storage Layout ────────────────────────────────────────────────────────
    // Ponytail: `avatarId` (uint8) + `exists` (bool) packed into the SAME 32-byte
    //           slot. Strings are always stored in their own slots (dynamic), so
    //           no further packing benefit exists beyond this pair.
    struct User {
        string  name;
        string  email;
        string  phone;
        string  bio;
        uint8   avatarId; // 1–6  ─┐ packed together
        bool    exists;   //       ─┘ (same 32-byte slot)
    }

    mapping(address => User) private _profiles;

    // ── Events ────────────────────────────────────────────────────────────────
    event ProfileCreated(address indexed user);
    event ProfileUpdated(address indexed user);
    event ProfileDeleted(address indexed user);

    // ── Errors ────────────────────────────────────────────────────────────────
    // Ponytail: Custom errors cost ~3× less gas than require() strings.
    error ProfileAlreadyExists();
    error ProfileNotFound();
    error InvalidAvatarId(uint8 given);

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyExisting() {
        if (!_profiles[msg.sender].exists) revert ProfileNotFound();
        _;
    }

    modifier validAvatar(uint8 id) {
        if (id < 1 || id > 6) revert InvalidAvatarId(id);
        _;
    }

    // ── Write ─────────────────────────────────────────────────────────────────
    function createProfile(
        string calldata name,
        string calldata email,
        string calldata phone,
        string calldata bio,
        uint8           avatarId
    ) external validAvatar(avatarId) {
        if (_profiles[msg.sender].exists) revert ProfileAlreadyExists();

        // Ponytail: Direct struct assignment in one SSTORE sequence.
        _profiles[msg.sender] = User({
            name:     name,
            email:    email,
            phone:    phone,
            bio:      bio,
            avatarId: avatarId,
            exists:   true
        });

        emit ProfileCreated(msg.sender);
    }

    function updateProfile(
        string calldata name,
        string calldata email,
        string calldata phone,
        string calldata bio,
        uint8           avatarId
    ) external onlyExisting validAvatar(avatarId) {
        // Ponytail: Write via storage pointer — avoids redundant slot loads.
        User storage u = _profiles[msg.sender];
        u.name     = name;
        u.email    = email;
        u.phone    = phone;
        u.bio      = bio;
        u.avatarId = avatarId;

        emit ProfileUpdated(msg.sender);
    }

    function deleteProfile() external onlyExisting {
        // `delete` zeroes the entire struct, reclaiming gas via SSTORE refund.
        delete _profiles[msg.sender];
        emit ProfileDeleted(msg.sender);
    }

    // ── Read ──────────────────────────────────────────────────────────────────
    /// @notice Returns the full profile. Callers must check `exists` before use.
    function getProfile(address user) external view returns (User memory) {
        return _profiles[user];
    }

    /// @notice Cheap existence check — avoids loading the full struct off-chain.
    function hasProfile(address user) external view returns (bool) {
        return _profiles[user].exists;
    }
}
