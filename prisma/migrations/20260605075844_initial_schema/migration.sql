-- CreateTable
CREATE TABLE `users` (
    `id_user` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_number` VARCHAR(191) NULL,
    `senha` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `born` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `user_status` ENUM('ACTIVO', 'INATIVO') NOT NULL DEFAULT 'ACTIVO',
    `role` ENUM('ADMINISTRADOR', 'OPERADOR', 'GERENTE') NOT NULL DEFAULT 'OPERADOR',

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_phone_number_key`(`phone_number`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs` (
    `id` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `user` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `details` TEXT NOT NULL,
    `ip` VARCHAR(191) NULL,
    `resource` VARCHAR(191) NOT NULL,
    `resource_id` VARCHAR(191) NULL,
    `old_value` TEXT NULL,
    `new_value` TEXT NULL,
    `duration` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `size` BIGINT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `tables` TEXT NOT NULL,
    `records_count` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NULL,
    `compression_ratio` DOUBLE NULL,
    `duration` INTEGER NULL,
    `error` VARCHAR(191) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfil` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `nivel` INTEGER NOT NULL DEFAULT 1,
    `permissoes` TEXT NOT NULL,
    `usuarios_count` INTEGER NOT NULL DEFAULT 0,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `perfil_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissoes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `modulo` VARCHAR(191) NOT NULL,
    `acao` VARCHAR(191) NOT NULL,
    `recurso` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `permissoes_modulo_acao_recurso_key`(`modulo`, `acao`, `recurso`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_perfis` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `perfil_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_perfis_perfil_id_idx`(`perfil_id`),
    UNIQUE INDEX `user_perfis_user_id_perfil_id_key`(`user_id`, `perfil_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_config` (
    `id` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `frequency` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NULL,
    `dayOfMonth` INTEGER NULL,
    `retention_days` INTEGER NOT NULL DEFAULT 30,
    `tables` TEXT NOT NULL,
    `compression` BOOLEAN NOT NULL DEFAULT true,
    `encryption` BOOLEAN NOT NULL DEFAULT false,
    `notification_email` VARCHAR(191) NULL,
    `last_run` DATETIME(3) NULL,
    `next_run` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id_client` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `nif` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_client`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estoque` (
    `id_estoque` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `date_validate` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `estado` ENUM('NAO_VENDIDO', 'EXPIRADO') NOT NULL DEFAULT 'NAO_VENDIDO',
    `category` VARCHAR(191) NULL,

    PRIMARY KEY (`id_estoque`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_config` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_config_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dividas` (
    `id_divida` VARCHAR(191) NOT NULL,
    `client_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `approval` ENUM('PAGAS', 'NAO_PAGAS') NOT NULL DEFAULT 'NAO_PAGAS',

    INDEX `Dividas_client_id_fkey`(`client_id`),
    INDEX `Dividas_product_id_fkey`(`product_id`),
    PRIMARY KEY (`id_divida`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturas` (
    `id_fatura` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `dataEmissao` DATETIME(3) NOT NULL,
    `dataVencimento` DATETIME(3) NULL,
    `clienteNome` VARCHAR(191) NOT NULL,
    `clienteNIF` VARCHAR(191) NULL,
    `clienteEndereco` VARCHAR(191) NULL,
    `clienteTelefone` VARCHAR(191) NULL,
    `clienteEmail` VARCHAR(191) NULL,
    `clienteCodigo` VARCHAR(191) NULL,
    `empresaNome` VARCHAR(191) NULL,
    `empresaNIF` VARCHAR(191) NULL,
    `empresaEndereco` VARCHAR(191) NULL,
    `empresaTelefone` VARCHAR(191) NULL,
    `empresaEmail` VARCHAR(191) NULL,
    `subtotal` DOUBLE NOT NULL,
    `impostos` DOUBLE NOT NULL,
    `descontos` DOUBLE NULL DEFAULT 0,
    `totalPagar` DOUBLE NOT NULL,
    `operador` VARCHAR(191) NOT NULL,
    `operadorId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'EMITIDA',
    `statusAGT` VARCHAR(191) NULL DEFAULT 'PENDENTE',
    `hashFiscal` VARCHAR(191) NULL,
    `qrCodeData` TEXT NULL,
    `codigoValidacao` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `faturas_numero_key`(`numero`),
    PRIMARY KEY (`id_fatura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fatura_items` (
    `id` VARCHAR(191) NOT NULL,
    `faturaId` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `precoUnitario` DOUBLE NOT NULL,
    `desconto` DOUBLE NULL DEFAULT 0,
    `impostos` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `taxaIVA` DOUBLE NOT NULL DEFAULT 14,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id_product` VARCHAR(191) NOT NULL,
    `name_product` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `date_validate` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `methodPayment` ENUM('MISTO', 'CACHE', 'TPA') NOT NULL DEFAULT 'CACHE',
    `totalLucro` VARCHAR(191) NULL,
    `estado` ENUM('VENDIDO', 'NAO_VENDIDO', 'EXPIRADO', 'VENDENDO') NOT NULL DEFAULT 'NAO_VENDIDO',
    `category` VARCHAR(191) NULL,

    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NULL,
    `nif` VARCHAR(191) NULL,
    `prazo_pagamento` INTEGER NULL DEFAULT 30,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `fornecedores_email_key`(`email`),
    UNIQUE INDEX `fornecedores_nif_key`(`nif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` VARCHAR(191) NOT NULL,
    `fornecedor_id` VARCHAR(191) NOT NULL,
    `data_pedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_entrega` DATETIME(3) NULL,
    `valor_total` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `compras_fornecedor_idx`(`fornecedor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `venda` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name_product` VARCHAR(191) NULL,
    `methodPayment` ENUM('MISTO', 'CACHE', 'TPA') NOT NULL DEFAULT 'CACHE',
    `date_validate` DATETIME(3) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `estado` ENUM('VENDIDO', 'NAO_VENDIDO', 'EXPIRADO', 'VENDENDO') NOT NULL DEFAULT 'NAO_VENDIDO',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `date_venda` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `category` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtosExpirados` (
    `id_expired` VARCHAR(191) NOT NULL,
    `id_product` VARCHAR(191) NOT NULL,
    `name_product` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `price` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL,
    `date_validate` DATETIME(3) NOT NULL,
    `date_expired` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `motivo` VARCHAR(191) NOT NULL DEFAULT 'Expirado automaticamente',
    `deleted_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_expired`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_perfis` ADD CONSTRAINT `user_perfis_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfil`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_perfis` ADD CONSTRAINT `user_perfis_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dividas` ADD CONSTRAINT `dividas_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id_client`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dividas` ADD CONSTRAINT `dividas_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id_product`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fatura_items` ADD CONSTRAINT `fatura_items_faturaId_fkey` FOREIGN KEY (`faturaId`) REFERENCES `faturas`(`id_fatura`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `venda` ADD CONSTRAINT `venda_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
