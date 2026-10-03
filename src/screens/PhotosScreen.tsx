import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { deletePhoto, listPhotos, setPrimaryPhoto } from '../lib/api/photos';
import { ApiError } from '../lib/api/client';
import { useTranslation } from '../lib/i18n/LanguageContext';
import { useToast } from '../components/ui/toast';
import type { PhotoResponse } from '../types/api';
import type { AppScreenProps } from '../navigation/types';
import { Screen } from '../components/layout/Screen';
import { PageHeader } from '../components/layout/PageHeader';
import { PageEmpty, PageError, PageLoading } from '../components/layout/PageState';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, spacing, type as typeScale } from '../theme/tokens';
import { useResponsive } from '../theme/responsive';

export default function PhotosScreen({ navigation }: AppScreenProps<'Photos'>) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { photoColumns } = useResponsive();
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPhotos(await listPhotos());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <PageLoading />;
  if (error) return <PageError message={error} onRetry={load} />;

  return (
    <Screen>
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
      <PageHeader title={t('photos') ?? 'Photos'} description="Your gallery. Own photos are never gated by plan." />
      <FlatList
        key={photoColumns}
        data={photos}
        keyExtractor={(item) => String(item.id)}
        numColumns={photoColumns}
        columnWrapperStyle={photoColumns > 1 ? styles.row : undefined}
        style={styles.list}
        ListEmptyComponent={<PageEmpty message="No photos yet" />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Image source={{ uri: item.thumbnailUrl || item.imageUrl }} style={styles.img} />
            {item.isPrimary ? <Text style={typeScale.micro}>Primary</Text> : null}
            <View style={styles.actions}>
              {!item.isPrimary ? (
                <Button title="Primary" size="sm" variant="outline" onPress={() => void setPrimaryPhoto(item.id).then(load)} />
              ) : null}
              <Button
                title="Delete"
                size="sm"
                variant="destructive"
                onPress={() =>
                  void deletePhoto(item.id)
                    .then(load)
                    .catch((err) => toast(err instanceof ApiError ? err.message : 'Delete failed', 'error'))
                }
              />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  card: { flex: 1, padding: spacing.sm, gap: 6 },
  img: { width: '100%', height: 140, backgroundColor: colors.muted, borderRadius: 8 },
  actions: { gap: 6 },
});
