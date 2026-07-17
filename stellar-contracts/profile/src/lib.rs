#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, token, Address, Env, String, BytesN, Val, Vec};
use soroban_env_common::Env as _;

const TTL_THRESHOLD: u32 = 120 * 17_280;
const TTL_EXTEND_TO: u32 = 180 * 17_280;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    ProfileAlreadyExists = 1,
    ProfileNotFound      = 2,
    InvalidAvatarId      = 3,
    NotAuthorized        = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Tier {
    None,
    Bronze,
    Silver,
    Gold,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserProfile {
    pub name:                String,
    pub email:               String,
    pub phone:               String,
    pub bio:                 String,
    pub avatar_id:           u32,
    pub cross_chain_address: String,
    pub tier:                Tier,
    pub quota:               u32,
}

#[contracttype]
pub enum DataKey {
    Profile(Address),
    Relayer,
}

#[contract]
pub struct ProfileContract;

#[contractimpl]
impl ProfileContract {

    pub fn initialize(env: Env, relayer: Address) {
        env.storage().instance().set(&DataKey::Relayer, &relayer);
    }

    // ── Protocol 27 Custom Account __check_auth ──────────────────────────────
    // Ponytail: CAP-0071 delegate_account_auth is a Protocol 27 host function.
    // This allows the relayer to sign on behalf of the smart account (Sponsorship/Fee-Bump).
    pub fn __check_auth(
        env: Env,
        _signature_payload: BytesN<32>,
        _signatures: Vec<Val>,
        _auth_context: Vec<Val>,
    ) -> Result<(), Error> {
        if let Some(relayer) = env.storage().instance().get::<DataKey, Address>(&DataKey::Relayer) {
            env.delegate_account_auth(relayer.to_object());
        }
        Ok(())
    }

    // ── Profile & SaaS Logic ──────────────────────────────────────────────────

    fn key(user: &Address) -> DataKey {
        DataKey::Profile(user.clone())
    }

    fn bump(env: &Env, user: &Address) {
        env.storage()
            .persistent()
            .extend_ttl(&Self::key(user), TTL_THRESHOLD, TTL_EXTEND_TO);
    }

    pub fn create_profile(
        env:       Env,
        user:      Address,
        name:                String,
        email:               String,
        phone:               String,
        bio:                 String,
        avatar_id:           u32,
        cross_chain_address: String,
    ) -> Result<(), Error> {
        user.require_auth();
        if avatar_id < 1 || avatar_id > 6 {
            return Err(Error::InvalidAvatarId);
        }

        let key = Self::key(&user);
        if env.storage().persistent().has(&key) {
            return Err(Error::ProfileAlreadyExists);
        }

        // Base profile starts with no tier and basic quota
        env.storage().persistent().set(&key, &UserProfile { 
            name, email, phone, bio, avatar_id, cross_chain_address,
            tier: Tier::None,
            quota: 10 // default starting quota
        });
        Self::bump(&env, &user);
        Ok(())
    }

    pub fn update_profile(
        env:       Env,
        user:      Address,
        name:                String,
        email:               String,
        phone:               String,
        bio:                 String,
        avatar_id:           u32,
        cross_chain_address: String,
    ) -> Result<(), Error> {
        user.require_auth();
        if avatar_id < 1 || avatar_id > 6 {
            return Err(Error::InvalidAvatarId);
        }

        let key = Self::key(&user);
        let mut profile = Self::get_profile(env.clone(), user.clone())?;
        
        profile.name = name;
        profile.email = email;
        profile.phone = phone;
        profile.bio = bio;
        profile.avatar_id = avatar_id;
        profile.cross_chain_address = cross_chain_address;

        env.storage().persistent().set(&key, &profile);
        Self::bump(&env, &user);
        Ok(())
    }

    pub fn get_profile(env: Env, user: Address) -> Result<UserProfile, Error> {
        env.storage()
            .persistent()
            .get(&Self::key(&user))
            .ok_or(Error::ProfileNotFound)
    }

    // Ponytail: NFT Tier Minting & Quota assignment handled natively in contract logic
    pub fn mint_tier(env: Env, user: Address, tier: Tier) -> Result<(), Error> {
        // In production, would require payment auth from treasury. For MVP relayer authorizes.
        if let Some(relayer) = env.storage().instance().get::<DataKey, Address>(&DataKey::Relayer) {
            relayer.require_auth();
        } else {
            return Err(Error::NotAuthorized);
        }

        let mut profile = Self::get_profile(env.clone(), user.clone())?;
        profile.tier = tier.clone();
        
        // Quota assignment based on Tier
        profile.quota = match tier {
            Tier::Bronze => 100,
            Tier::Silver => 500,
            Tier::Gold => 1000,
            Tier::None => 10,
        };

        env.storage().persistent().set(&Self::key(&user), &profile);
        Self::bump(&env, &user);
        Ok(())
    }

    // Consume AI quota natively
    pub fn consume_quota(env: Env, user: Address) -> Result<(), Error> {
        user.require_auth();
        let mut profile = Self::get_profile(env.clone(), user.clone())?;
        
        if profile.quota > 0 {
            profile.quota -= 1;
            env.storage().persistent().set(&Self::key(&user), &profile);
            Self::bump(&env, &user);
            Ok(())
        } else {
            Err(Error::NotAuthorized)
        }
    }
}
