'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import styles from './profile.module.css'

export default function ProfilePage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  const [nickname, setNickname] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIconFile(file)
      setIconPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    const supabase = createClient(url, key)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return alert('ログインしてください')

    // ★ 既存データを取得（icon_url を維持するため）
    const { data: existing } = await supabase
      .from('children')
      .select('icon_url')
      .eq('user_id', user.id)
      .single()

    let icon_url = existing?.icon_url ?? null

    // ★ アイコンが新しく選択された場合のみアップロード
    if (iconFile) {
      const filePath = `icons/${user.id}-${Date.now()}.png`
      const { error: uploadError } = await supabase.storage
        .from('child-icons')
        .upload(filePath, iconFile)

      if (uploadError) {
        console.error(uploadError)
        alert('画像アップロードに失敗しました')
        return
      }

      const { data: urlData } = supabase.storage
        .from('child-icons')
        .getPublicUrl(filePath)

      icon_url = urlData.publicUrl
    }

    // ★ age を削除した upsert
    const { error: upsertError } = await supabase.from('children').upsert(
      {
        user_id: user.id,
        name: nickname,
        birthday,
        gender,
        native_language: nativeLanguage,
        icon_url,
      },
      { onConflict: 'user_id' },
    )

    console.error('UPSERT ERROR:', upsertError)

    if (upsertError) {
      console.error(upsertError)
      alert('プロフィールの保存に失敗しました')
      return
    }

    alert('プロフィールを保存しました')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Image
          src="/images/background_purple-2.png"
          alt="background"
          fill
          className={styles.bg}
        />

        <input
          type="text"
          placeholder="ニックネーム/Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={styles.nicknameInput}
        />

        <label className={styles.iconUpload}>
          {iconPreview ? (
            <Image
              src={iconPreview}
              alt="icon"
              fill
              className={styles.iconImg}
            />
          ) : (
            <span className={styles.camera}>📷</span>
          )}
          <input
            type="file"
            className={styles.hiddenInput}
            onChange={handleIconChange}
          />
        </label>
      </div>

      <div className={styles.form}>
        <label>生年月日/Birthday</label>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />

        <label>性別/Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">選択してください/Select</option>
          <option value="male">男の子/Boy</option>
          <option value="female">女の子/Girl</option>
        </select>

        <label>母国語/Native Language</label>
        <select
          value={nativeLanguage}
          onChange={(e) => setNativeLanguage(e.target.value)}
        >
          <option value="">選択してください/Select</option>
          <option value="japanese">日本語/Japanese</option>
          <option value="english">英語/English</option>
        </select>

        <button className={styles.okButton} onClick={handleSave}>
          OK
        </button>

        <button className={styles.cancelButton}>キャンセル/Cancel</button>
      </div>
    </div>
  )
}
