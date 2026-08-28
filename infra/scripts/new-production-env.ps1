param(
    [Parameter(Mandatory = $true)]
    [string]$Domain,
    [string]$OpenAiModel = 'gpt-5.6-terra'
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$target = Join-Path $repositoryRoot '.env.production'
if (Test-Path -LiteralPath $target) {
    throw "Refusing to overwrite existing $target"
}

function New-Secret {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToHexString($bytes).ToLowerInvariant()
}

$mysqlPassword = New-Secret
$adminUsername = 'admin_' + (New-Secret).Substring(0, 16)
$openAiApiKey = $env:OPENAI_API_KEY
if ([string]::IsNullOrWhiteSpace($openAiApiKey)) {
    $secureKey = Read-Host 'OpenAI Project API Key' -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
    try {
        $openAiApiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}
if ([string]::IsNullOrWhiteSpace($openAiApiKey)) {
    throw 'OpenAI API Key must not be empty.'
}
$content = @(
    "VISAFY_DOMAIN=$Domain"
    'NEXT_PUBLIC_DEFAULT_LANGUAGE=ko'
    'MYSQL_DATABASE=visafy'
    'MYSQL_USER=visafy'
    "MYSQL_PASSWORD=$mysqlPassword"
    "MYSQL_ROOT_PASSWORD=$(New-Secret)"
    "DB_PASSWORD=$mysqlPassword"
    "ADMIN_USERNAME=$adminUsername"
    "ADMIN_PASSWORD=$(New-Secret)"
    "ADMIN_JWT_SECRET=$(New-Secret)"
    "RAG_INTERNAL_TOKEN=$(New-Secret)"
    'LLM_PROVIDER=openai'
    "OPENAI_API_KEY=$openAiApiKey"
    "OPENAI_MODEL=$OpenAiModel"
    'OPENAI_REASONING_EFFORT=medium'
    'EMBEDDING_PROVIDER=fastembed'
    'EMBEDDING_MODEL=intfloat/multilingual-e5-small'
    'EMBEDDING_DIMENSIONS=384'
)
[IO.File]::WriteAllLines($target, $content, [Text.UTF8Encoding]::new($false))
Write-Output "Created $target. This file is ignored by Git."
