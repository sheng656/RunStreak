# 005 — AI-powered Screenshot OCR Import via Gemini

**Status:** decided
**Date:** 2026-06-30

## Context
Manually typing in run metrics (distance, duration, date) is tedious. Users often want to import activities from popular running platforms (Strava, Garmin, Nike Run Club, Keep).

## Decision
1. Add an upload button to the Log Run page accepting screenshot images.
2. Use **Google Gemini 3.1 Flash Lite** (via the `Google.GenAI` SDK) to parse the image.
3. Use a structured system prompt requesting JSON output matching the target schema.
4. Auto-fill form fields on the frontend with visual indicators showing which fields were imported.

## Why
- **Zero-Dependency Multimodal**: Gemini handles image inputs natively, allowing us to send raw image bytes in-memory without needing intermediate Azure Blob storage.
- **Conversion Reliability**: The LLM handles cross-platform variations (Strava vs Garmin layouts) and unit conversion (miles to km, pace formats) reliably compared to custom programmatic OCR template parsing.
- **Safety**: The API key is kept on the server (environment configuration) and never exposed to the frontend. Form data is verified by the user before final submission.
