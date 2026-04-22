use anchor_lang::prelude::*;
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

declare_id!("4GxwZ9zqv2HtCgZDygkoVBxMBHtJCHyawYPMaBMsZnjk");

#[program]
pub mod fixtures {
    use super::*;

    pub fn update_admin(ctx: Context<UpdateAdmin>) -> Result<()> {
        // SW001 pattern: key equality check without signer enforcement.
        if ctx.accounts.authority.key() != ctx.accounts.state.admin {
            return err!(ErrorCode::Unauthorized);
        }

        ctx.accounts.state.admin = ctx.accounts.new_admin.key();
        Ok(())
    }

    pub fn process_unchecked_deser(ctx: Context<ProcessUncheckedDeser>) -> Result<()> {
        // SW002 pattern: deserialize from raw bytes without owner validation nearby.
        let raw = &ctx.accounts.target_account.try_borrow_data()?;
        let mut data_slice: &[u8] = &raw[..];
        let _parsed: State = State::try_deserialize(&mut data_slice)?;
        Ok(())
    }

    pub fn do_dynamic_cpi(ctx: Context<DoDynamicCpi>) -> Result<()> {
        // SW003 pattern: CPI target comes from an unchecked account.
        let ix = Instruction {
            program_id: ctx.accounts.external_program.key(),
            accounts: vec![],
            data: vec![],
        };
        invoke(&ix, &[])?;
        Ok(())
    }

    pub fn derive_with_user_bump(_ctx: Context<DeriveWithUserBump>, bump: u8) -> Result<()> {
        // SW004 pattern: user-provided bump + create_program_address.
        let seeds: &[&[u8]] = &[b"state", &[bump]];
        let _pda = Pubkey::create_program_address(seeds, &crate::ID)
            .map_err(|_| error!(ErrorCode::InvalidPda))?;
        Ok(())
    }

    pub fn unsafe_math_and_cast(ctx: Context<UnsafeMathAndCast>, input: u64) -> Result<()> {
        // SW005 pattern: unchecked arithmetic + narrowing cast.
        let doubled = input * 2;
        let narrowed = doubled as u8;
        ctx.accounts.state.counter = narrowed as u64;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    /// CHECK: intentionally AccountInfo to trigger SW001 pattern.
    pub authority: AccountInfo<'info>,
    /// CHECK: demo only.
    pub new_admin: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ProcessUncheckedDeser<'info> {
    /// CHECK: intentionally raw account for SW002 fixture.
    pub target_account: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DoDynamicCpi<'info> {
    /// CHECK: intentionally unchecked for SW003 fixture.
    pub external_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct DeriveWithUserBump<'info> {
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnsafeMathAndCast<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
}

#[account]
pub struct State {
    pub admin: Pubkey,
    pub counter: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid PDA")]
    InvalidPda,
}