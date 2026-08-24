package com.visafy.journey;

import java.util.Locale;

public enum FinancialPurposeCode {
    OPEN_ACCOUNT,
    RECEIVE_SALARY,
    SAVE_MONEY,
    SEND_MONEY_HOME,
    GET_DEBIT_CARD,
    GET_CREDIT_CARD,
    GET_LOAN,
    RENT_HOUSING,
    INVEST,
    BUILD_CREDIT;

    public static FinancialPurposeCode from(String raw) {
        if (raw == null || raw.isBlank()) return OPEN_ACCOUNT;
        return switch (raw.strip().toUpperCase(Locale.ROOT)) {
            case "ACCOUNT" -> OPEN_ACCOUNT;
            case "SAVINGS" -> SAVE_MONEY;
            case "LOAN" -> GET_LOAN;
            case "CARD" -> GET_DEBIT_CARD;
            case "INVESTMENT" -> INVEST;
            default -> {
                try { yield valueOf(raw.strip().toUpperCase(Locale.ROOT)); }
                catch (IllegalArgumentException ignored) { yield OPEN_ACCOUNT; }
            }
        };
    }

    public int targetStep() {
        return switch (this) {
            case OPEN_ACCOUNT -> 2;
            case RECEIVE_SALARY -> 3;
            case GET_DEBIT_CARD -> 4;
            case SAVE_MONEY -> 5;
            case SEND_MONEY_HOME -> 6;
            case BUILD_CREDIT, GET_CREDIT_CARD -> 7;
            case GET_LOAN, RENT_HOUSING -> 8;
            case INVEST -> 9;
        };
    }

    public String productPurpose() {
        return switch (this) {
            case OPEN_ACCOUNT, RECEIVE_SALARY -> "ACCOUNT";
            case SAVE_MONEY -> "SAVINGS";
            case GET_DEBIT_CARD, GET_CREDIT_CARD, BUILD_CREDIT -> "CARD";
            case GET_LOAN, RENT_HOUSING -> "LOAN";
            case INVEST -> "INVESTMENT";
            case SEND_MONEY_HOME -> "ACCOUNT";
        };
    }
}
