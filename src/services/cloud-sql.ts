/**
 * Represents the data structure for a project's performance metrics.
 */
export interface ProjectData {
  /**
   * The unique identifier for the project.
   */
  project_id: string;
  /**
   * The city where the project is located.
   */
  city: string;
  /**
   * The RAG (Red, Amber, Green) status indicating project health.
   */
  rag_status: string;
  /**
   * The weekly run rate of the project.
   */
  run_rate: number;
  /**
   * The timestamp of the last data update.
   */
  last_updated: string;
}

/**
 * Asynchronously retrieves project data from Google Cloud SQL.
 *
 * @returns A promise that resolves to an array of ProjectData objects.
 */
export async function getProjectData(): Promise<ProjectData[]> {
  // TODO: Implement this by calling the Google Cloud SQL API.

  return [
    {
      project_id: '123',
      city: 'BLR_A',
      rag_status: 'Green',
      run_rate: 75,
      last_updated: '2024-01-01'
    },
    {
      project_id: '456',
      city: 'BLR_B',
      rag_status: 'Amber',
      run_rate: 60,
      last_updated: '2024-01-01'
    },
    {
      project_id: '789',
      city: 'CHN',
      rag_status: 'Red',
      run_rate: 40,
      last_updated: '2024-01-01'
    },
    {
      project_id: '101',
      city: 'NCR',
      rag_status: 'Green',
      run_rate: 90,
      last_updated: '2024-01-01'
    },
    {
      project_id: '112',
      city: 'HYD',
      rag_status: 'Amber',
      run_rate: 50,
      last_updated: '2024-01-01'
    }
  ];
}
