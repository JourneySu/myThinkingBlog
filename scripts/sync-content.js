import fs from 'fs';
import path from 'path';

// === 設定區：依你的實際路徑調整 ===
const VAULT_SOURCE_DIR = 'D:\\File\\Books\\21_Public創作';
const VAULT_ASSETS_DIR = 'D:\\File\\Books\\99_assets';
const DEST_CONTENT_DIR = path.resolve('./src/content/blog');
const DEST_IMAGES_DIR = path.resolve('./public/images');

// 確保目標資料夾存在
fs.mkdirSync(DEST_CONTENT_DIR, { recursive: true });
fs.mkdirSync(DEST_IMAGES_DIR, { recursive: true });

// 1. 複製文章（.md檔）
const mdFiles = fs.readdirSync(VAULT_SOURCE_DIR).filter(f => f.endsWith('.md'));
console.log(`找到 ${mdFiles.length} 篇文章：`, mdFiles);

const referencedImages = new Set();

for (const file of mdFiles) {
	const srcPath = path.join(VAULT_SOURCE_DIR, file);
	const destPath = path.join(DEST_CONTENT_DIR, file);
	const content = fs.readFileSync(srcPath, 'utf-8');

	// 複製文章內容到 Astro 專案
	fs.writeFileSync(destPath, content, 'utf-8');
	console.log(`✅ 已複製文章：${file}`);

	// 2. 掃描文章中所有 ![[圖片]] 語法
	const matches = content.matchAll(/!\[\[([^\]|]+)(\|[^\]]+)?\]\]/g);
	for (const match of matches) {
		referencedImages.add(match[1].trim());
	}
}

console.log(`\n找到 ${referencedImages.size} 個被引用的圖片：`, [...referencedImages]);

// 3. 只複製「有被引用到」的圖片
for (const imageName of referencedImages) {
	const srcImagePath = path.join(VAULT_ASSETS_DIR, imageName);
	const destImagePath = path.join(DEST_IMAGES_DIR, imageName);

	if (fs.existsSync(srcImagePath)) {
		fs.copyFileSync(srcImagePath, destImagePath);
		console.log(`🖼️  已複製圖片：${imageName}`);
	} else {
		console.warn(`⚠️  警告：找不到圖片 "${imageName}"，請確認檔名是否正確（存在於 99_assets 嗎？）`);
	}
}

console.log('\n同步完成！');