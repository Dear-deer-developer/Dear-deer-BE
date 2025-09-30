export interface AlarmFcmPayload {
  type: 'ALARM';
  alarmId: string;
  musicId: string;
  musicTitle: string;
  musicArtist: string;
  scheduledAt: string;
}
