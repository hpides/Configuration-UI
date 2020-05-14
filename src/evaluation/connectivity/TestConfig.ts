export interface TestConfig {
    repeat: number;
    scaleFactor: number;
    activeInstancesPerSecond: number;
    maximumConcurrentRequests: number;
    name: string | undefined | null,
    stories: Story[]; 
}

export interface Story {
    name: string;
    scalePercentage: number;
}