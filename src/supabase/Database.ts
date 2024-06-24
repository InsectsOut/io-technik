export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Clientes: {
        Row: {
          apellidos: string | null
          created_at: string
          email: string
          id: number
          nombre: string
          responsable_id: number | null
          telefono: string
          tipo_cliente: string
          update_at: string
        }
        Insert: {
          apellidos?: string | null
          created_at?: string
          email: string
          id?: number
          nombre: string
          responsable_id?: number | null
          telefono: string
          tipo_cliente: string
          update_at?: string
        }
        Update: {
          apellidos?: string | null
          created_at?: string
          email?: string
          id?: number
          nombre?: string
          responsable_id?: number | null
          telefono?: string
          tipo_cliente?: string
          update_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Clientes_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "Responsables"
            referencedColumns: ["id"]
          },
        ]
      }
      Direcciones: {
        Row: {
          calle: string
          ciudad: string
          codigo_postal: string
          colonia: string
          created_at: string
          estado: string
          id: number
          numero_ext: string
          numero_int: string | null
          piso: string | null
          udpated_at: string
        }
        Insert: {
          calle: string
          ciudad: string
          codigo_postal: string
          colonia: string
          created_at?: string
          estado: string
          id?: number
          numero_ext: string
          numero_int?: string | null
          piso?: string | null
          udpated_at?: string
        }
        Update: {
          calle?: string
          ciudad?: string
          codigo_postal?: string
          colonia?: string
          created_at?: string
          estado?: string
          id?: number
          numero_ext?: string
          numero_int?: string | null
          piso?: string | null
          udpated_at?: string
        }
        Relationships: []
      }
      Empleados: {
        Row: {
          activo: boolean
          created_at: string
          id: number
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: number
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: number
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Plagas: {
        Row: {
          created_at: string
          id: number
          plaga: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          plaga?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          plaga?: string | null
        }
        Relationships: []
      }
      plaguicidas: {
        Row: {
          dosis_max: string | null
          dosis_min: string | null
          id: number
          ingrediente_activo: string | null
          nombre: string | null
          presentacion: string | null
          registro: string | null
        }
        Insert: {
          dosis_max?: string | null
          dosis_min?: string | null
          id?: number
          ingrediente_activo?: string | null
          nombre?: string | null
          presentacion?: string | null
          registro?: string | null
        }
        Update: {
          dosis_max?: string | null
          dosis_min?: string | null
          id?: number
          ingrediente_activo?: string | null
          nombre?: string | null
          presentacion?: string | null
          registro?: string | null
        }
        Relationships: []
      }
      Productos: {
        Row: {
          created_at: string
          dosificacion: number | null
          id: number
          nombre: string
          registro_cofepris: string | null
          tags: string[] | null
          tipo_producto: string
          unidades: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosificacion?: number | null
          id?: number
          nombre: string
          registro_cofepris?: string | null
          tags?: string[] | null
          tipo_producto: string
          unidades?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosificacion?: number | null
          id?: number
          nombre?: string
          registro_cofepris?: string | null
          tags?: string[] | null
          tipo_producto?: string
          unidades?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      RegistroAplicacion: {
        Row: {
          area_aplicacion: string | null
          cantidad: number | null
          created_at: string
          id: number
          producto_id: number | null
          servicio_id: number
          tipo_aplicacion: string | null
          tipo_plaga_id: number | null
          unidad: string | null
          updated_at: string
        }
        Insert: {
          area_aplicacion?: string | null
          cantidad?: number | null
          created_at?: string
          id?: number
          producto_id?: number | null
          servicio_id: number
          tipo_aplicacion?: string | null
          tipo_plaga_id?: number | null
          unidad?: string | null
          updated_at?: string
        }
        Update: {
          area_aplicacion?: string | null
          cantidad?: number | null
          created_at?: string
          id?: number
          producto_id?: number | null
          servicio_id?: number
          tipo_aplicacion?: string | null
          tipo_plaga_id?: number | null
          unidad?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "RegistroAplicacion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "plaguicidas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RegistroAplicacion_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "Servicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "RegistroAplicacion_tipo_plaga_id_fkey"
            columns: ["tipo_plaga_id"]
            isOneToOne: false
            referencedRelation: "Plagas"
            referencedColumns: ["id"]
          },
        ]
      }
      Responsables: {
        Row: {
          cliente_id: number | null
          created_at: string
          email: string | null
          id: number
          nombre: string
          puesto: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          nombre: string
          puesto: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          nombre?: string
          puesto?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Responsables_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "Clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      Servicios: {
        Row: {
          aplicador_Responsable: number | null
          cancelado: boolean | null
          cliente_id: number
          created_at: string | null
          direccion_id: number | null
          fecha_servicio: string
          folio: number
          frecuencia_recomendada: string | null
          horario_servicio: string
          id: number
          observaciones: string | null
          orden_compra: string | null
          realizado: boolean | null
          responsable_id: number | null
          tipo_folio: string | null
          tipo_plaga_array_id: number[] | null
          tipo_plaga_id: number | null
          tipo_servicio: string | null
          updated_at: string | null
        }
        Insert: {
          aplicador_Responsable?: number | null
          cancelado?: boolean | null
          cliente_id: number
          created_at?: string | null
          direccion_id?: number | null
          fecha_servicio: string
          folio?: number
          frecuencia_recomendada?: string | null
          horario_servicio: string
          id?: number
          observaciones?: string | null
          orden_compra?: string | null
          realizado?: boolean | null
          responsable_id?: number | null
          tipo_folio?: string | null
          tipo_plaga_array_id?: number[] | null
          tipo_plaga_id?: number | null
          tipo_servicio?: string | null
          updated_at?: string | null
        }
        Update: {
          aplicador_Responsable?: number | null
          cancelado?: boolean | null
          cliente_id?: number
          created_at?: string | null
          direccion_id?: number | null
          fecha_servicio?: string
          folio?: number
          frecuencia_recomendada?: string | null
          horario_servicio?: string
          id?: number
          observaciones?: string | null
          orden_compra?: string | null
          realizado?: boolean | null
          responsable_id?: number | null
          tipo_folio?: string | null
          tipo_plaga_array_id?: number[] | null
          tipo_plaga_id?: number | null
          tipo_servicio?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_Servicios_aplicador_Responsable_fkey"
            columns: ["aplicador_Responsable"]
            isOneToOne: false
            referencedRelation: "Empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_Servicios_tipo_plaga_id_fkey"
            columns: ["tipo_plaga_id"]
            isOneToOne: false
            referencedRelation: "Plagas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Servicios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "Clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Servicios_direccion_id_fkey"
            columns: ["direccion_id"]
            isOneToOne: false
            referencedRelation: "Direcciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Servicios_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "Responsables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
